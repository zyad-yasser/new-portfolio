import { Grid } from '@material-ui/core';
import * as React from 'react';
import ActionButton from '../action-button/action-button.component';
import styles from './contact-form.module.sass';
import { Formik } from 'formik';
import { sendEmailAction } from '@/actions';
import { useState } from 'react';
import { store } from 'react-notifications-component';

const ContactForm = (props) => {
  const [error, setError] = useState<string|null>(null);

  const validateForm = (values) => {
    const errors: any = {};
    if (!values.email) {
      errors.email = 'This field is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
      errors.email = 'Invalid email address';
    } else if (!values.content) {
      errors.content = 'This field is required';
    } else if (values.content.length < 4) {
      errors.content = 'Very xsall content, write some more';
    }
    return errors;
  };

  const sendEmail = async (data, { setSubmitting }) => {
    try {
      await sendEmailAction(data);
        store.addNotification({
        title: "Sent",
        message: "Email sent successfully",
        type: "success",
        insert: "top",
        container: "top-right",
        animationIn: ["animate__animated", "animate__fadeIn"],
        animationOut: ["animate__animated", "animate__fadeOut"],
        dixsiss: {
          duration: 5000,
          onScreen: true
        }
      });
    } catch (error) {
      setError('Error sending email');
        store.addNotification({
        title: "Error",
        message: "Problem sending email",
        type: "danger",
        insert: "top",
        container: "top-right",
        animationIn: ["animate__animated", "animate__fadeIn"],
        animationOut: ["animate__animated", "animate__fadeOut"],
        dixsiss: {
          duration: 5000,
          onScreen: true
        }
      });
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <div
      className={`d-flex align-items-center justify-content-center w-100 mt-5 ${styles.contactForm}`}
    >
      <Formik
        initialValues={{ email: '', name: '', subject: '', content: '' }}
        validate={validateForm}
        onSubmit={sendEmail}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          handleSubmit,
          isSubmitting,
        }) => (
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <input
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.name}
                  className="one-input"
                  placeholder="name"
                  name="name"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <input
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.subject}
                  className="one-input"
                  placeholder="subject"
                  name="subject"
                />
              </Grid>
              <Grid item xs={12} md={12}>
                <input
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.email}
                  className="one-input"
                  placeholder="email"
                  name="email"
                />
                { errors.email && touched.email && errors.email &&
                  <div className="err-message">
                    { errors.email }
                  </div>
                }
              </Grid>
              <Grid item xs={12} md={12}>
                <textarea
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.content}
                  className="one-input"
                  placeholder="content"
                  name="content"
                ></textarea>
                { errors.content && touched.content && errors.content &&
                  <div className="err-message">
                    { errors.content }
                  </div>
                }
              </Grid>
              <Grid item xs={12} md={12}>
                <ActionButton
                  classes="hvr-ripple-out"
                  style={{ marginLeft: 'auto' }}
                  state={ isSubmitting ? 'loading' : 'ready' }
                  label="send"
                  type="submit"
                  disabled={ errors && Object.keys(errors).length }
                />
              </Grid>
            </Grid>
          </form>
        )}
      </Formik>
    </div>
  );
};

export default ContactForm;
